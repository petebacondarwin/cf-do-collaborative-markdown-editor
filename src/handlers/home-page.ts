/**
 * A simple handler that (effectively) returns a static HTML file.
 *
 * If using "Workers Pages" this would be handled for us.
 */
export function homePage() {
  return new Response(
    `
    <html>
      <body>
        <button id="save">Save</button>
        <textarea id="input"></textarea>
        <div id="output"></div>
      </body>

      <script>
        const saveButton = document.getElementById('save');
        const inputBox = document.getElementById('input');
        const outputBox = document.getElementById('output');
        const socket = new WebSocket("wss://" + window.location.host + "/connect?doc=my-doc");

        // Inbound event handling
        socket.addEventListener('open', e => socket.send(JSON.stringify({type: 'init'})));
        socket.addEventListener('error', e => {debugger;});
        socket.addEventListener('close', e => {debugger;});
        socket.addEventListener('message', e => {
          const msg = JSON.parse(e.data);
          switch(msg.type) {
            case "changed":
              updateUI(msg.input, msg.output);
              break;
            case "saved":
              saveButton.textContent = "Save";
              break;
          }
        });

        // Outbound event handling
        input.addEventListener('input', e => updateServer(e.target.value));
        saveButton.addEventListener('click', save);
        

        // Helper functions
        let saveTimer = null;
        function updateServer(content) {
          socket.send(JSON.stringify({type: 'update', content}));

          // Auto-save throttled to 2 second intervals
          if (!saveTimer) {
            saveTimer = setTimeout(() => {
              save();
              saveTimer = null;
            }, 2000);
          }
        }

        function updateUI(input, output) {
          inputBox.value = input;
          outputBox.innerHTML = output;
        }

        function save() {
          socket.send(JSON.stringify({type: 'save'}));
          saveButton.textContent = 'Saving...';
        }
      </script>
    </html>
    `,
    { headers: new Headers({ "content-type": "text/html" }) }
  );
}
