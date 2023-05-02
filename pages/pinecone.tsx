import type { NextPage } from 'next';
import PineconeChat from '@/components/ChatWindow/PineconeDocsChat'
import Layout from '@/components/Layout/Layout';

const Pinecone: NextPage = () => {
    return (
        <Layout>
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-4">
                        <PineconeChat />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Pinecone;
