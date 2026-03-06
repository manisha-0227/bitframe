# BitFrame | An Online IDE

## Demo

[<img src="/src/assets/codedeck.png" alt="Home Page"/>](https://www.youtube.com/watch?v=mEFBdhQmpy4&t=3s&ab_channel=VishalRajput)

## Project Objective

1. Create a playground area where one can create multiple code snippets and run it using an online compiler and execution system(Judge0)
2. Create a Code Editor Frontend using ReactJS (CodeMirror package)
3. Implemented flexible layout structure using styled components
4. Use Rapid API to setup our Judge0 API
5. Add multi-language support (cpp, python, java, javascript)
6. Add multi-theme support 
7. Upload and Download Code
8. Input and Output console(can upload text files for input & download output)
9. Functionality to save multiple playground in local storage
10. Add Fullscreen Support
11. **AI Code Assistant** - Generate, modify, and optimize code using natural language prompts


## Technologies Used

- React JS - for frontend 
- Styled Components  - for styling
- Judge0 CE API - to create and get submissions
- Rapid API - to Setup Judge0 CE API
- Axios - to make API calls
- React Router - For routing
- OpenAI API - for AI-powered code generation and modification

## AI Code Assistant Setup

The AI Code Assistant feature allows you to generate, modify, and optimize code using natural language prompts.

### Setup Instructions

1. **Get an OpenAI API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up or log in to your account
   - Create a new API key

2. **Configure Environment Variables:**
   - Create a `.env` file in the root directory of the project
   - Add your OpenAI API key:
     ```
     REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
     ```
   - **Run Code** uses the public [Judge0 CE](https://ce.judge0.com) API – no API key required.
   - **Important:** Never commit your `.env` file to version control

3. **Restart the Development Server:**
   - After adding the API key, restart your development server:
     ```bash
     npm run dev
     ```

### Using the AI Assistant

1. Click the robot icon button in the bottom-right corner to open the AI Assistant
2. Type a natural language prompt describing what you want to do with your code
3. Examples:
   - "Add error handling to this function"
   - "Optimize this code for better performance"
   - "Add comments explaining the logic"
   - "Create a function to calculate factorial"
4. The AI will analyze your prompt, modify the code accordingly, and update the editor automatically

### Features

- **Natural Language Understanding:** Describe what you want in plain English
- **Code Analysis:** AI analyzes your current code and understands the context
- **Automatic Updates:** Generated code is automatically inserted into the editor
- **Language-Aware:** Understands the programming language you're working with
- **Formatting Preserved:** Maintains proper code formatting and indentation
- **Error Handling:** Provides clear error messages if something goes wrong 

# Link & References 

- [Live Project Link](https://code-deck.vercel.app/)
- [Judge0 CE API Testing](https://rapidapi.com/judge0-official/api/judge0-ce)
- [Judge0 CE API Documentation](https://ce.judge0.com/)
- [Styled Component Documentation](https://styled-components.com/docs/basics) -> for styling
- [CodeMirror](https://uiwjs.github.io/react-codemirror/) -> for Coding Editor
- [Vercel](https://vercel.com/) -> for hoisting
