import { SimpleSequentialChain, LLMChain, SequentialChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";



// https://python.langchain.com/en/latest/modules/chains/generic/sequential_chains.html


// This is an LLMChain to write a synopsis given a title of a play.
const llm = new OpenAI({ temperature: 0.7 });

const simpleSeqChain = async () => {

    // chainA(title: string) -> synopsis: string
    // chainB(synopsis: string) -> review: string

    const template = `You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
 
  Title: {title}
  Playwright: This is a synopsis for the above play:`;

    const promptTemplate = new PromptTemplate({
        template,
        inputVariables: ["title"],
    });

    const synopsisChain = new LLMChain({ llm, prompt: promptTemplate });

    const reviewTemplate = `You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.
 
  Play Synopsis:
  {synopsis}
  Review from a New York Times play critic of the above play:`;
    const reviewPromptTemplate = new PromptTemplate({
        template: reviewTemplate,
        inputVariables: ["synopsis"],
    });
    const reviewChain = new LLMChain({
        llm: llm,
        prompt: reviewPromptTemplate,
    });

    const overallChain = new SimpleSequentialChain({
        chains: [synopsisChain, reviewChain],
        verbose: true,
    });
    const review = await overallChain.run("Tragedy at sunset on the beach");
    console.log("🚀 ~ file: sequential_chain.tsx:44 ~ simpleSeqChain ~ review:", review)
}

const complexSeqChain = async () => {

    const template = `You are a playwright. Given the title of play and the era it is set in, it is your job to write a synopsis for that title.

    Title: {title}
    Era: {era}
    Playwright: This is a synopsis for the above play:`;
    const promptTemplate = new PromptTemplate({
        template,
        inputVariables: ["title", "era"],
    });
    const synopsisChain = new LLMChain({
        llm,
        prompt: promptTemplate,
        outputKey: "synopsis",
    });

    // This is an LLMChain to write a review of a play given a synopsis.
    const reviewTemplate = `You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.
  
   Play Synopsis:
   {synopsis}
   Review from a New York Times play critic of the above play:`;
    const reviewPromptTempalte = new PromptTemplate({
        template: reviewTemplate,
        inputVariables: ["synopsis"],
    });
    const reviewChain = new LLMChain({
        llm,
        prompt: reviewPromptTempalte,
        outputKey: "review",
    });

    const overallChain = new SequentialChain({
        chains: [synopsisChain, reviewChain],
        inputVariables: ["era", "title"],
        // Here we return multiple variables
        outputVariables: ["synopsis", "review"],
        verbose: true,
    });
    const chainExecutionResult = await overallChain.call({
        title: "Tragedy at sunset on the beach",
        era: "Victorian England",
    });
    console.log(chainExecutionResult);
}

const memorySeqChain = async () => {
    const template = `You are a social media manager for a theater company.  Given the title of play, the era it is set in, the date,time and location, the synopsis of the play, and the review of the play, it is your job to write a social media post for that play.

    Here is some context about the time and location of the play:
    Date and Time: {time}
    Location: {location}
    
    Play Synopsis:
    {synopsis}
    Review from a New York Times play critic of the above play:
    {review}
    
    Social Media Post:
`;

    const promptTemplate = new PromptTemplate({
        template,
        inputVariables: ["synopsis", "review", "time", "location"],
    });

    const socialChain = new LLMChain({
        llm,
        prompt: promptTemplate,
        outputKey: "social_post_text",
    });

    const overallChain = new SequentialChain({
        chains: [socialChain],
        inputVariables: ["era", "title", "time", "location"],
        outputVariables: ["social_post_text"],
        verbose: true,
    });
    // const chainExecutionResult = await overallChain.call({
    //     memory: new BufferMemory({
    //         memoryKey: { "time": "December 25th, 8pm PST", "location": "Theater in the Park" }
    //     }),
    //     title: "Tragedy at sunset on the beach",
    //     era: "Victorian England",
    //     time: "7pm",
    //     location: "The Globe Theater",
    // });
    // console.log(chainExecutionResult);

}



export const run = async () => {
    // await simpleSeqChain();
    //  await complexSeqChain();
    await memorySeqChain();
}
(async () => {
    await run();
    console.log('complete');
})();
