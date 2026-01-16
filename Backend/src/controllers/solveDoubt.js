const { GoogleGenerativeAI } = require("@google/generative-ai");

// Modern Gemini models available in current API
const modelsToTry = [
    // ✅ WORKING - Confirmed from your logs
    "gemini-2.5-flash-lite",      // ~1,000 RPD. Fastest, most cost-efficient
    "gemini-2.5-flash",           // ~250 RPD. Best balance for general tasks
    "gemini-2.0-flash",           // ~200 RPD. Good alternative
    
    // ⚠️ These may not be available in all regions/accounts
    "gemini-2.5-pro",             // ~50-100 RPD. Most capable model
    "gemini-1.5-flash-001",       // Try specific version of 1.5 if available
    "gemini-1.5-pro-001",         // Try specific version of 1.5 pro
];


function extractPromptFromMessages(messages) {
    if (!messages) return "";
    
    if (Array.isArray(messages)) {
        // Get the last user message
        const userMessages = messages.filter(msg => msg.role === 'user');
        if (userMessages.length > 0) {
            return userMessages[userMessages.length - 1].parts[0]?.text || "";
        }
        // Fallback to last message if no user messages
        return messages[messages.length - 1]?.parts[0]?.text || "";
    }
    
    return String(messages);
}

// Utility to create optimized system instruction
function createSystemInstruction(title, description, testCases, startCode) {
    let context = `Problem: ${title || 'Unknown DSA Problem'}`;
    
    if (description) {
        // Truncate description to save tokens
        context += `\n\nDescription: ${description.length > 300 ? description.substring(0, 300) + '...' : description}`;
    }
    
    if (testCases && testCases.length > 0) {
        context += `\n\nExamples: ${testCases.length} test case${testCases.length > 1 ? 's' : ''} provided`;
    }
    
    if (startCode && startCode.length > 0) {
        const languages = startCode.map(sc => sc.language).filter(Boolean);
        if (languages.length > 0) {
            context += `\n\nAvailable languages: ${languages.join(', ')}`;
        }
    }
    
    return `You are an expert Data Structures and Algorithms (DSA) tutor.
    
${context}

YOUR ROLE:
- ONLY help with DSA topics related to this problem
- For non-DSA topics: "I'm sorry, I can only help with Data Structures and Algorithms questions."
- Provide hints, code reviews, time complexity analysis
- Suggest different approaches and optimal solutions
- Explain concepts clearly with examples

Response guidelines:
1. Be concise and clear
2. Provide code examples when relevant
3. Explain time/space complexity
4. Use appropriate DSA terminology
5. Focus on helping the user learn, not just giving answers`;
}

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;
        
        console.log('📨 Received request for problem:', title || 'Unknown');
        console.log('📊 Messages length:', Array.isArray(messages) ? messages.length : 1);
        
        if (!messages) {
            return res.status(400).json({
                message: "Messages are required",
                success: false
            });
        }
        
        // Check if API key is available
        if (!process.env.GEMINI_KEY) {
            console.error('❌ GEMINI_KEY environment variable is not set');
            return res.status(500).json({
                message: "AI service configuration error",
                error: "API key not configured",
                success: false
            });
        }
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        
        // Prepare content
        const promptText = extractPromptFromMessages(messages);
        const systemInstruction = createSystemInstruction(title, description, testCases, startCode);
        
        console.log(`📝 Prompt length: ${promptText.length} characters`);
        console.log(`⚙️  System instruction length: ${systemInstruction.length} characters`);
        
        if (!promptText.trim()) {
            return res.status(400).json({
                message: "Empty prompt - please provide a valid question",
                success: false
            });
        }
        
        let lastError = null;
        let successfulModel = null;
        let aiResponse = null;
        let attempts = 0;
        
        // Try each model in sequence
        for (const modelName of modelsToTry) {
            attempts++;
            try {
                console.log(`🔄 Attempt ${attempts}: Trying model "${modelName}"`);
                
                // Skip image models for text-only requests
                if (modelName.includes('image') || modelName.includes('vision')) {
                    console.log(`⏭️  Skipping image model "${modelName}" for text-only request`);
                    continue;
                }
                
                // Configure the model
                const generationConfig = {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 1024,
                };
                
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction,
                    generationConfig: generationConfig,
                });
                
                // Generate content with timeout
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), 15000)
                );
                
                const resultPromise = model.generateContent(promptText);
                const result = await Promise.race([resultPromise, timeoutPromise]);
                
                const response = await result.response;
                aiResponse = response.text();
                successfulModel = modelName;
                
                console.log(`✅ Success with model: ${modelName}`);
                console.log(`📤 Response length: ${aiResponse.length} characters`);
                
                break; // Exit loop on success
                
            } catch (modelError) {
                lastError = modelError;
                const errorMsg = modelError.message || String(modelError);
                
                console.log(`❌ Model "${modelName}" failed: ${errorMsg.substring(0, 100)}...`);
                
                // Handle specific error types
                if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
                    console.log(`📉 Quota exceeded for "${modelName}". Trying next model...`);
                    // Exponential backoff: wait longer after each quota error
                    const delay = Math.min(1000 * Math.pow(1.5, attempts), 5000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('NOT_FOUND')) {
                    console.log(`🚫 Model "${modelName}" not available in your API. Trying next...`);
                    continue;
                }
                
                if (errorMsg.includes('timeout')) {
                    console.log(`⏰ Model "${modelName}" timed out. Trying next...`);
                    continue;
                }
                
                if (errorMsg.includes('permission') || errorMsg.includes('PERMISSION_DENIED')) {
                    console.log(`🔒 No permission for model "${modelName}". Trying next...`);
                    continue;
                }
                
                // For other errors, try next model after short delay
                console.log(`⚠️  Unknown error with "${modelName}". Trying next model...`);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        // Handle successful response
        if (successfulModel && aiResponse) {
            return res.status(200).json({
                message: aiResponse,
                modelUsed: successfulModel,
                attempts: attempts,
                success: true,
                timestamp: new Date().toISOString()
            });
        }
        
        // All models failed
        console.error('💥 All models failed after', attempts, 'attempts');
        console.error('Last error:', lastError?.message);
        
        // Create informative fallback response
        const fallbackResponse = `I'm currently unable to connect to the AI service due to technical limitations.

For the problem **"${title || 'your DSA problem'}"**, here's a structured approach:

## 🔍 Problem Analysis
1. **Understand requirements**: ${description ? description.substring(0, 100) + '...' : 'Review the problem statement carefully'}
2. **Identify constraints**: Consider time/space complexity requirements
3. **Data structure selection**: Arrays, HashMaps, Two Pointers, Sliding Window
4. **Algorithm design**: Brute force → Optimize → Refine

## 💡 Common Approaches for Array Problems
- **Two Pointers**: O(n) time, O(1) space
- **Sliding Window**: O(n) time, O(1) or O(k) space
- **Hash Map (Prefix Sum)**: O(n) time, O(n) space
- **Sorting**: O(n log n) time, O(1) or O(n) space

## 🚀 Next Steps
- Try rephrasing your question
- Break the problem into smaller parts
- Consider edge cases (empty arrays, negative numbers)
- Draw diagrams to visualize the solution

The service should be available again shortly. Please try again in a few moments.`;

        return res.status(200).json({
            message: fallbackResponse,
            modelUsed: 'fallback',
            attempts: attempts,
            success: false,
            error: lastError?.message || 'All models failed',
            timestamp: new Date().toISOString(),
            note: 'This is a fallback response - AI service unavailable'
        });
        
    } catch (err) {
        console.error('💣 Critical error in solveDoubt:', err.message);
        console.error(err.stack);
        
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            error: err.message,
            success: false,
            timestamp: new Date().toISOString()
        });
    }
};

// Function to test available models (run on startup)
// async function initializeModelChecker() {
//     try {
//         console.log('🔍 Checking available Gemini models...');
        
//         const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
//         const models = await genAI.listModels();
        
//         console.log('📋 Found', models.length, 'available models:');
        
//         // Filter and display only modern models
//         const modernModels = models.filter(model => {
//             const name = model.name;
//             return name.includes('2.5') || name.includes('2.0') || name.includes('1.5-flash-001') || name.includes('1.5-pro-001');
//         });
        
//         console.log('🎯 Modern models available:');
//         modernModels.forEach(model => {
//             console.log(`  - ${model.name} (${model.displayName || 'no display name'})`);
//         });
        
//         // Update modelsToTry with actually available models
//         const availableModelNames = modernModels.map(m => m.name);
//         console.log('✅ Models that will be tried:', availableModelNames);
        
//     } catch (error) {
//         console.log('⚠️ Could not list models:', error.message);
//         console.log('Using default model list...');
//     }
// }

// // Initialize on startup
// setTimeout(initializeModelChecker, 1000);

module.exports = solveDoubt;