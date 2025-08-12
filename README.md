
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


### 4. Configure your API Key
`uwu` needs an API key to function. You can set it using the `OPENAI_API_KEY` environment variable:

```bash
export OPENAI_API_KEY="your_api_key_here"
```

Alternatively, you can pass the API key directly using the `--api-key` (or `-k`) flag.

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

## Advanced Usage

`uwu` can be configured to use different models and API providers through command-line flags and environment variables.

### Configuration

#### Environment Variables
*   `OPENAI_API_KEY`: Sets your API key.
*   `UWU_MODEL`: Sets a custom default model to use instead of `gpt-4.1`. This is useful if you primarily use a local model with Ollama or another provider.

    ```bash
    # Set your default model to llama3
    export UWU_MODEL="llama3"
    ```

#### Flags

*   `--api-key`, `-k`: Your API key.
*   `--model`, `-m`: The model to use (e.g., `gpt-4`, `claude-3-opus-20240229`).
*   `--base-url`, `-b`: The base URL of the API endpoint.

### Examples

#### OpenAI
```bash
# Using a specific model
uwu -m gpt-3.5-turbo "find all files larger than 10MB"

# Providing the API key directly
uwu -k "sk-..." "list all running docker containers"
```

#### Claude
You can use `uwu` with Claude models through an OpenAI-compatible proxy.
```bash
# Example using a proxy service
uwu -k <your-claude-key> -m claude-3-opus-20240229 -b <proxy-base-url> "summarize the contents of README.md"
```

#### Gemini
You can use `uwu` with Gemini models through an OpenAI-compatible proxy.
```bash
# Example using a proxy service
uwu -k <your-gemini-key> -m gemini-pro -b <proxy-base-url> "what is the current weather"
```

#### Ollama (local)
Make sure Ollama is running. No API key is needed.
```bash
# Use the llama3 model
uwu -m llama3 -b http://localhost:11434/v1 "create a new git branch called 'features/new-ui'"
```

#### LM Studio (local)
Make sure your local server is running in LM Studio. No API key is needed by default.
```bash
# Port 1234 is the default for LM Studio
uwu -b http://localhost:1234/v1 "refactor the following python code..."
```

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
