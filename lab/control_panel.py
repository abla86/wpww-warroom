"""
WPWW WarRoom - Interaktivt kontrollpanel.

Terminalgrensesnitt for den samlede WPWW-enheten.

Prinsipper:
- Bevar eksisterende funksjoner og tilpass eldre API-kontrakter til dagens runtime.
- Ikke anta at en tjeneste, modul eller test er tilgjengelig: rapporter UNKNOWN ved manglende observasjon.
- Bruk én samlet WPWW-runtime på BASE_URL.
- Bruk læringsmatrisen og modulkontrollen når de finnes lokalt.
- Brukerfiler inspiseres som data; de kjøres ikke automatisk av kontrollpanelet.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import requests

BASE_URL = os.getenv("WPWW_URL", "http://localhost:8080").rstrip("/")
USER_FILES = Path(os.getenv("WPWW_USER_FILES", "/app/user_files"))
TIMEOUT = float(os.getenv("WPWW_CONTROL_TIMEOUT", "4"))

try:
    from learning_matrix import display_learning_module
except ImportError:
    display_learning_module = None  # type: ignore[assignment]

try:
    from module_control import snapshot as module_snapshot, set_module
except ImportError:
    module_snapshot = None  # type: ignore[assignment]
    set_module = None  # type: ignore[assignment]


class Colors:
    """ANSI-farger for en lesbar terminal uten eksterne UI-avhengigheter."""

    HEADER = "\033[95m"
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    END = "\033[0m"


def c(text: str, style: str) -> str:
    return f"{style}{text}{Colors.END}"


def request(
    path: str,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
) -> tuple[int, Any]:
    """Kall mot WPWW og returner (HTTP-status, dekodet body).

    Status 0 betyr at målet ikke kunne nås. Det tolkes aldri som PASS.
    """
    try:
        response = requests.request(
            method,
            f"{BASE_URL}{path}",
            json=payload,
            timeout=TIMEOUT,
        )
        try:
            body: Any = response.json()
        except ValueError:
            body = response.text
        return response.status_code, body
    except requests.RequestException as exc:
        return 0, {"status": "UNKNOWN", "verified": False, "error": str(exc)}


def print_result(status: int, body: Any) -> None:
    if status == 0:
        label = c("UNKNOWN / UNREACHABLE", Colors.YELLOW)
    elif 200 <= status < 300:
        label = c(f"HTTP {status}", Colors.GREEN)
    elif status in {400, 403, 404, 409}:
        label = c(f"HTTP {status}", Colors.YELLOW)
    else:
        label = c(f"HTTP {status}", Colors.RED)
    print(label)
    if isinstance(body, (dict, list)):
        print(json.dumps(body, ensure_ascii=False, indent=2))
    else:
        print(str(body))


def pause() -> None:
    try:
        input(c("\nTrykk Enter for å fortsette...", Colors.BOLD))
    except (EOFError, KeyboardInterrupt):
        print()


def show_health() -> None:
    print(c("\n[ SYSTEMHELSERAPPORT ]", Colors.BLUE))
    status, body = request("/healthz")
    print_result(status, body)


def show_warroom() -> None:
    print(c("\n[ FULL WPWW-STATUS ]", Colors.BLUE))
    status, body = request("/api/warroom")
    print_result(status, body)


def set_mode() -> None:
    try:
        value = input("Mode [LIVE/DEMO]: ").strip().upper()
    except (EOFError, KeyboardInterrupt):
        print()
        return
    if value not in {"LIVE", "DEMO"}:
        print(c("Ugyldig modus. Tillatt: LIVE eller DEMO.", Colors.YELLOW))
        return
    status, body = request("/api/mode", "POST", {"mode": value})
    print_result(status, body)


def toggle_lockdown() -> None:
    status, state = request("/healthz")
    if status != 200 or not isinstance(state, dict):
        print_result(status, state)
        return
    enabled = bool(state.get("lockdown"))
    path = "/api/lockdown/reset" if enabled else "/api/lockdown"
    status, body = request(path, "POST")
    print_result(status, body)


def controlled_probe() -> None:
    """Kjør WPWWs interne, kontrollerte testscenario."""
    status, body = request("/api/simulate", "POST")
    if status == 404:
        try:
            scenario_id = input(
                "Scenario [clean/deception/malformed/encoded] (Enter=deception): "
            ).strip() or "deception"
        except (EOFError, KeyboardInterrupt):
            print()
            return
        status, body = request("/api/scenario", "POST", {"scenario": scenario_id})
    print_result(status, body)


def test_alert() -> None:
    status, body = request("/api/alerts/test", "POST")
    if status == 404:
        print(c("Alert-test-rute finnes ikke i dagens runtime; ingen antakelse gjøres.", Colors.YELLOW))
    print_result(status, body)


def show_audit_logs() -> None:
    status, body = request("/audit-logs")
    if status == 404:
        status, body = request("/api/incidents")
    print_result(status, body)


def show_learning_matrix() -> None:
    if display_learning_module is None:
        print(c("learning_matrix.py er ikke tilgjengelig i denne runtime-en.", Colors.YELLOW))
        return

    print("\n1. Angrepsmodeller")
    print("2. Forsvarsmodeller")
    try:
        category = input("Velg [1-2]: ").strip()
    except (EOFError, KeyboardInterrupt):
        print()
        return
    if category not in {"1", "2"}:
        print(c("Ugyldig kategori.", Colors.YELLOW))
        return
    selected_category = "attacks" if category == "1" else "defenses"
    display_learning_module(selected_category)

    try:
        topic = input("Nøkkel for detaljer (Enter for bare liste): ").strip()
    except (EOFError, KeyboardInterrupt):
        print()
        return
    if topic:
        display_learning_module(selected_category, topic)


def show_modules() -> None:
    print(c("\n[ MODULKONTROLL ]", Colors.BLUE))
    if module_snapshot is None:
        print(c("module_control.py er ikke tilgjengelig lokalt.", Colors.YELLOW))
        return
    try:
        print(json.dumps(module_snapshot(), ensure_ascii=False, indent=2))
    except Exception as exc:
        print(c(f"Kunne ikke lese modulstatus: {exc}", Colors.RED))


def modify_module() -> None:
    if set_module is None:
        print(c("module_control.py er ikke tilgjengelig lokalt.", Colors.YELLOW))
        return

    try:
        module_id = input("Modul-ID: ").strip()
        if not module_id:
            print(c("Modul-ID kan ikke være tom.", Colors.YELLOW))
            return
        print("\nLa felt stå tomt for å ikke endre det.")
        selected_raw = input("selected [true/false]: ").strip().lower()
        locked_raw = input("locked [true/false]: ").strip().lower()
        mode = input("mode: ").strip()
    except (EOFError, KeyboardInterrupt):
        print()
        return

    kwargs: dict[str, Any] = {}
    if selected_raw:
        if selected_raw not in {"true", "false"}:
            print(c("selected må være true eller false.", Colors.YELLOW))
            return
        kwargs["selected"] = selected_raw == "true"
    if locked_raw:
        if locked_raw not in {"true", "false"}:
            print(c("locked må være true eller false.", Colors.YELLOW))
            return
        kwargs["locked"] = locked_raw == "true"
    if mode:
        kwargs["mode"] = mode

    try:
        result = set_module(module_id, **kwargs)
    except Exception as exc:
        print(c(f"Modulendring feilet: {exc}", Colors.RED))
        return
    print(json.dumps(result, ensure_ascii=False, indent=2))


def list_user_files() -> list[Path]:
    if not USER_FILES.exists():
        return []
    try:
        return sorted(p for p in USER_FILES.rglob("*") if p.is_file())
    except OSError as exc:
        print(c(f"Kunne ikke lese user_files: {exc}", Colors.RED))
        return []


def inspect_user_files() -> None:
    files = list_user_files()
    if not files:
        print(f"Ingen filer funnet i {USER_FILES}")
        return
    for index, path in enumerate(files, 1):
        try:
            relative = path.relative_to(USER_FILES)
        except ValueError:
            relative = path.name
        print(f"[{index}] {relative}")


def show_reports() -> None:
    print(c("\n[ RAPPORTER ]", Colors.BLUE))
    for endpoint in ("/api/report.json", "/api/report.csv", "/api/report.html"):
        status, body = request(endpoint)
        print(f"\n{endpoint}")
        if status == 200:
            print(c("AVAILABLE / RESPONSE VERIFIED", Colors.GREEN))
            text = body if isinstance(body, str) else json.dumps(body, ensure_ascii=False, indent=2)
            print(text[:4000])
        else:
            print_result(status, body)


def banner() -> None:
    print(c("=" * 64, Colors.HEADER))
    print(c("WPWW WARROOM // UNIFIED CONTROL PANEL", Colors.BOLD))
    print(c("=" * 64, Colors.HEADER))
    print(f"Runtime: {BASE_URL}")


def menu() -> None:
    while True:
        try:
            banner()
            print(
                "\n"
                " [1] System health\n"
                " [2] Full WPWW state\n"
                " [3] LIVE / DEMO\n"
                " [4] Local lockdown / reset\n"
                " [5] Controlled probe / scenario\n"
                " [6] Alert test\n"
                " [7] Audit logs / incidents\n"
                " [8] Learning matrix\n"
                " [9] Module control\n"
                "[10] Change module state\n"
                "[11] Inspect user_files\n"
                "[12] Reports\n"
                "[13] Exit\n"
            )
            choice = input(c("Velg: ", Colors.BOLD)).strip()

            if choice == "1":
                show_health()
            elif choice == "2":
                show_warroom()
            elif choice == "3":
                set_mode()
            elif choice == "4":
                toggle_lockdown()
            elif choice == "5":
                controlled_probe()
            elif choice == "6":
                test_alert()
            elif choice == "7":
                show_audit_logs()
            elif choice == "8":
                show_learning_matrix()
            elif choice == "9":
                show_modules()
            elif choice == "10":
                modify_module()
            elif choice == "11":
                inspect_user_files()
            elif choice == "12":
                show_reports()
            elif choice == "13":
                print("Avslutter kontrollpanelet.")
                return
            else:
                print(c("Ugyldig valg. Velg et nummer i menyen.", Colors.YELLOW))

            pause()
        except KeyboardInterrupt:
            print(c("\nAvbrutt av bruker. Kontrollpanelet avsluttes.", Colors.GREEN))
            return
        except EOFError:
            print(c("\nInput-strøm avsluttet. Kontrollpanelet avsluttes.", Colors.YELLOW))
            return
        except Exception as exc:
            print(c(f"Uventet kontrollpanel-feil: {exc}", Colors.RED))
            pause()


if __name__ == "__main__":
    menu()
