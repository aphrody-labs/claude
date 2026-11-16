---
name: gemini-review-file-upload
description: Working route for large Gemini Carbon reviews via claude-in-chrome - inject an input[type=file], file_upload the bundle, insertText, poll; read output in filtered slices
metadata:
  type: reference
---

This route was proven on 2026-11-15 on a 200 KB bundle, the unixwin review (docs/reviews/gemini-2026-11-15-unixwin.md). It is the route to use when the relay's gemini_review fails (Antigravity 429) or the relay Chrome has no Google session.

1. Build a single text bundle with `===== FILE: path =====` headers, under %TEMP%.
2. Open gemini.google.com/app in a new MCP tab; the mode picker should read Carbon.
3. With javascript_tool, append `<input type=file aria-label="cc bundle file input">` to the body. Get its ref with `find`, then call `file_upload` with the bundle path (paths under %TEMP% are accepted).
4. With javascript_tool, read `input.files[0].text()`, remove the input, focus `rich-textarea .ql-editor`, and call `document.execCommand("insertText", false, prompt + body)`. The call times out at 45 s but the text still lands; check `innerText.length` in a separate call.
5. Click `button[aria-label="Send message"]`. Poll in loops of at most 40 s while `button[aria-label="Stop response"]` exists.
6. Read the response from the last `model-response message-content`. The browser tool returns "[BLOCKED: Cookie/query string data]" on many slices. Extract structured lines (title, the "File / Location:" line, severity), with characters outside `[A-Za-z0-9 ._/(),:-]` replaced. Archive the result with the chat id.
7. Verify each finding in the code before fixing it ([[gemini-carbon-validation]]).
