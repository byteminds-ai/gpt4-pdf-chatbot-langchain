import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import {
  PINECONE_INDEX_NAME,
  PINECONE_NAME_SPACE_MORSE_FEDERICK,
  PINECONE_NAME_SPACE_PINECONE_DOCS_CRAWLED,
} from '@/config/pinecone';
import cache from 'memory-cache'; // import the caching library
import { HNSWLib } from 'langchain/vectorstores/hnswlib';

const CACHE_KEY_PREFIX = 'langchain_cache'; // set a prefix for the cache key

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history = [], type = 'morse', directory } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
  // assign namespace from switch on context

  let namespace;
  switch (type) {
    case 'morse':
      namespace = PINECONE_NAME_SPACE_MORSE_FEDERICK;
      break;
    case 'pinecone-docs':
      namespace = PINECONE_NAME_SPACE_PINECONE_DOCS_CRAWLED;
      break;
    default:
      namespace = PINECONE_NAME_SPACE_MORSE_FEDERICK;
      break;
  }

  const cacheKey = `${CACHE_KEY_PREFIX}_${sanitizedQuestion}`; // create a unique cache key for the current request

  // check if response is cached
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    console.log(`Returning cached response for question: ${sanitizedQuestion}`);
    return res.status(200).json(cachedResponse);
  }

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    let vectorStore;

    // if type is 'buffer' then we need to create a different vector store
    if (type === 'buffer') {
      vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings());
    } else {
      /* create vectorstore*/
      vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({}),
        {
          pineconeIndex: index,
          textKey: 'text',
          namespace, //namespace comes from your config folder
        },
      );
    }

    //create chain
    const chain = makeChain(vectorStore);

    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    // cache the response for future requests
    cache.put(cacheKey, response, 10000); // cache response for 10 seconds

    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
