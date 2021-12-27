export async function handleRequest(request: Request): Promise<Response> {
  if (request.url.endsWith('index.html')) {
    return homePage();
  }
  if (request.url.endsWith('rendered.json')) {
    return render(await request.text());
  }
  return new Response(`request method: ${request.method}`)
}

function homePage() {
  return new Response(`
  <html>
    <body>
      <textarea id="input"></textarea>
      <div id="output"></div>
    </body>
    <script>
      const input = document.getElementById('input');
      const output = document.getElementById('output');
      input.addEventListener('input', async (e) => {
        const response = await fetch('rendered.json', {method: 'POST', body: e.target.value});
        const rendered = await response.text();
        output.innerHTML = rendered;
      });
    </script>
  </html>
  `,
  { headers: new Headers({'content-type': "text/html"})});
}

function render(text: string) {
  return new Response(text.toUpperCase());
}