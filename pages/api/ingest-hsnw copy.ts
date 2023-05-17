import { OpenAI } from 'langchain/llms/openai';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { VectorStoreInfo } from 'langchain/agents';
import { NextApiRequest, NextApiResponse } from 'next';
const CACHE_HSNW_VS_PREFIX = 'hsnw_vectorstore'; // set a prefix for the cache key
import cache from 'memory-cache'; // import the caching library
import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseFileContent(
  fileContent: Buffer,
  type: string,
): Promise<string> {
  if (type === 'pdf') {
    const data = await pdfParse(Buffer.from(fileContent));
    return data.text;
  }
  // Add more file types to parse as needed
  return fileContent.toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing the uploaded file' });
        return;
      }

      const file = files.file as unknown as File;
      const type = (fields.type as string) || 'pdf';

      if (!file) {
        return res.status(400).json({ message: 'No file in the request' });
      }

      // Read the file content
      const fileContent = fs.readFileSync(file.filepath);
      const parsedContent = await parseFileContent(fileContent, type);
      console.log('filecontent reading over');
      const filename = file?.originalFilename?.replace(/\.[^/.]+$/, ''); // strip off extension
      console.log('filename determined');

      // store the file content in the filesystem
      const rawFilePath = path.join(
        process.cwd(),
        'docs',
        'results',
        `rawDocs-${filename}.json`,
      );
      console.log(
        '🚀 ~ file: ingest-hsnw.ts:56 ~ form.parse ~ rawFilePath:',
        rawFilePath,
      );
      fs.writeFileSync(rawFilePath, JSON.stringify(parsedContent));
      console.log('fs write over');

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      const docs = await textSplitter.createDocuments([parsedContent]);
      // write the docs to the filesystem
      const docsFilePath = path.join(
        process.cwd(),
        'docs',
        'results',
        `docs-${filename}`,
      );
      fs.writeFileSync(docsFilePath, JSON.stringify(docs));

      const vectorStore = await HNSWLib.fromDocuments(
        docs,
        new OpenAIEmbeddings(),
      );

      // // extract first 1000 characters from parsedContent as description
      // const description = parsedContent.substring(0, 1000);

      // const vectorStoreInfo: VectorStoreInfo = {
      //   name: filename?.toString() || 'unknown',
      //   description,
      //   vectorStore,
      // };

      const cacheKey = `${CACHE_HSNW_VS_PREFIX}_${filename}`;
      cache.put(cacheKey, vectorStore, 10000);

      const outputPath = path.join(
        process.cwd(),
        'docs',
        'results',
        `${cacheKey}.json`,
      );
      // fs.writeFileSync(outputPath, JSON.stringify(vectorStore), 'utf8');

      await vectorStore.save(outputPath);

      res.status(200).json({ data: 'success' });
    });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
