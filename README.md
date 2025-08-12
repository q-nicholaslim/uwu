
<h1 align="center">
  <br>
  <a href="https://github.com/context-labs/uwu"><img src="https://raw.githubusercontent.com/context-labs/uwu/main/assets/uwu.jpg" alt="uwu" width="200" style="border-radius:8px;"></a>
   <br>
  uwu
  <br>
</h1>

<h4 align="center">✨ Natural language to shell commands using AI ✨</h4>

<p align="center">
  <a href="https://x.com/inference_net">
    <img alt="X (formerly Twitter)" src="https://img.shields.io/badge/X-@inference.net-1DA1F2?style=flat&logo=x&logoColor=white" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://github.com/context-labs/uwu">
    <img alt="GitHub" src="https://img.shields.io/github/stars/context-labs/uwu?style=social" />
  </a>
  
</p>

<p align="center">
  <a href="#what-is-this">What is this?</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a>
</p>

## What is this?

`uwu` is a lightweight, focused CLI tool that converts natural language into shell commands using Large Language Models (LLMs) like GPT-5. Unlike comprehensive agentic development tools like [Claude Code](https://www.anthropic.com/claude-code) or [Cursor](https://cursor.com), `uwu` has a simple, singular purpose: **helping you write shell commands faster, without switching context**.

`uwu` is not a replacement for comprehensive agentic development tools -- it is simple tool that excels at one thing. Consider it the terminal equivalent of quickly searching "how do I..." and getting an immediately runnable answer.


![uwu demo](https://raw.githubusercontent.com/context-labs/uwu/main/assets/uwu.gif)


After a response is generated, you can edit it before pressing enter to execute the command. This is useful if you want to add flags, or other modifications to the command.


## Installation

### 1. Clone the repo
```bash
git clone https://github.com/context-labs/uwu.git
cd uwu
```

### 2. Install dependencies and build
Make sure you have [Bun](https://bun.sh) installed.

```bash
bun install
bun run build
```

This will produce the `uwu-cli` binary in the `dist/` build output directory.


### 3. Make the binary executable and move it into your PATH
```bash
chmod +x dist/uwu-cli
mv dist/uwu-cli /usr/local/bin/uwu-cli
```


### 4. Configuration
`uwu` is configured through a `config.json` file. The first time you run `uwu`, it will automatically create this file and the necessary directories for you.

#### Configuration File Location
The `config.json` file is located in a platform-specific directory, depending on your operating system:
*   **Linux:** `~/.config/uwu/config.json`
*   **macOS:** `~/Library/Application Support/uwu/config.json`
*   **Windows:** `%APPDATA%\\uwu\\config.json` (e.g., `C:\\Users\\<user>\\AppData\\Roaming\\uwu\\config.json`)

#### Configuration Options
Here is an example of a `config.json` file:

```json
{
  "apiKey": "sk-your_openai_api_key",
  "model": "gpt-4.1",
  "baseURL": null
}
```

*   `apiKey` (string): Your API key. The tool prioritizes the key set in this file. However, if `apiKey` is missing or set to an empty string (`""`), `uwu` will fall back to using the `OPENAI_API_KEY` environment variable.
*   `model` (string): The model you want to use. Defaults to `"gpt-4.1"` if not specified.
*   `baseURL` (string | null): The base URL for the API. This is useful for connecting to local models like Ollama or other OpenAI-compatible services.

**Example for Ollama:**
To use `uwu` with a local Ollama server running the `llama3` model, your `config.json` would look like this:
```json
{
  "model": "llama3",
  "baseURL": "http://localhost:11434/v1"
}
```
In this case, no `apiKey` is required.

### 5. Add the `uwu` helper function to your `~/.zshrc`
This function lets you type `uwu <description>` and get an editable command preloaded in your shell.

```zsh
# ~/.zshrc

uwu() {
  local cmd
  cmd="$(uwu-cli "$@")" || return
  vared -p "" -c cmd
  print -s -- "$cmd"   # add to history
  eval "$cmd"
}
```

After editing `~/.zshrc`, reload it:
```bash
source ~/.zshrc
```

## Usage

Once installed and configured:

```bash
uwu generate a new ssh key called uwu-keyand add it to the ssh agent
```

You'll see the generated command in your shell's input line. Press **Enter** to run it, or edit it first. Executed commands will show up in your shell's history just like any other command.

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
