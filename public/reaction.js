(() => {
  const ASCII_FINGER = String.raw`
     .------.
    /  .--.  \
   |  /    \  |
   | |  ( ) | |
   |  \  --/  |
    \  '--'  /
     '------'
   WPWW // NOPE
`;

  function showReaction(event) {
    const overlay = document.createElement('div');
    overlay.id = 'wpww-reaction';
    overlay.innerHTML = `
      <div class="wpww-reaction-inner">
        <div class="wpww-reaction-title">ACCESS BLOCKED</div>
        <pre>${ASCII_FINGER}</pre>
        <div class="wpww-reaction-note">Controlled deception response • nothing executed remotely</div>
        <button type="button" id="wpww-reaction-close">DISMISS</button>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('wpww-reaction-close')?.addEventListener('click', () => overlay.remove());
    window.setTimeout(() => overlay.remove(), 7000);
    return event;
  }

  window.WPWWReaction = { showReaction };
})();
