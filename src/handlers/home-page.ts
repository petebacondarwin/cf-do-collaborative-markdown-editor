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
        <textarea id="input"></textarea>
        <div id="output"></div>
      </body>

      <script>
        const input = document.getElementById('input');
        const output = document.getElementById('output');
        const socket = new WebSocket("wss://" + window.location.host + "/connect");
        
        socket.addEventListener('open', e => socket.send(JSON.stringify({type: 'init'})));
        socket.addEventListener('error', e => {debugger;});
        socket.addEventListener('close', e => {debugger;});
        socket.addEventListener('message', e => update(e.data));

        input.addEventListener('input', e => socket.send(JSON.stringify({type: 'update', content: e.target.value})));

        function update(data) {
          const json = JSON.parse(data);
          input.value = json.input;
          output.innerHTML = json.output;
        }
      </script>
    </html>
    `,
    { headers: new Headers({ "content-type": "text/html" }) }
  );
}
