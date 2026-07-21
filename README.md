# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6cebe9f7-dcb9-4e6e-b066-cb6197ac9c01

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Research Prototype

The repository also includes a separate Python prototype under `research/` for policy snapshot monitoring and `restriction_rules.json` generation.

1. Install Python dependencies listed in `research/requirements.txt`.
2. Run `python -m research.main run` to fetch snapshots and refresh the rule database.
3. Run `python -m research.main shadowban --post-url <url> --platform <name>` to record a mock shadowban check.

