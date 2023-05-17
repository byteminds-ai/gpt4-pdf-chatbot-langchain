import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate
} from "langchain/prompts";

import { LLMChain } from 'langchain/chains';

const model = new OpenAI({ temperature: 0 });

const simple_llm = async () => {
    const template = "What is a good name for a company that makes {product}?";
    const prompt = new PromptTemplate({ template, inputVariables: ["product"] });
    const chainA = new LLMChain({ llm: model, prompt });
    const resA = await chainA.call({ product: "colorful socks" });
    console.log({ resA });

    // apply allows you run the chain against a list of inputs:
    const input_list = [
        { "product": "socks" },
        { "product": "computer" },
        { "product": "shoes" }
    ];
    const resA2 = await chainA.apply(input_list);
    console.log({ resA2 });
}

const llm_from_chatprompt = async () => {
    // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
    const chat = new ChatOpenAI({ temperature: 0 });
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
            "You are a helpful assistant that translates {input_language} to {output_language}."
        ),
        HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);
    const chainB = new LLMChain({
        prompt: chatPrompt,
        llm: chat,
    });
    const resB = await chainB.call({
        input_language: "English",
        output_language: "French",
        text: "I love programming.",
    });
    console.log({ resB });
}

// export run function
export const run = async () => {
    //  await simple_llm();
    // await llm_from_chatprompt();
}

(async () => {
    await run();
    console.log('ingestion complete');
})();



