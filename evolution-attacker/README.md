# WPWW Evolution Lab

Closed-loop defensive experiment for WPWW.

The agent does **not** accept arbitrary targets or perform arbitrary exploitation. It selects from a fixed set of local test scenarios exposed by WPWW and records which scenarios produce useful defensive observations.

Modes:

- `observe`: choose scenarios and collect responses
- `learn`: update strategy weights from observed outcomes
- `demo`: bounded run with a finite number of steps

Use this only against the local WPWW instance you control.
