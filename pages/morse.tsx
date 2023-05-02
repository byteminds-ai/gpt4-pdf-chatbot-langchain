import type { NextPage } from 'next';
import MorseChat from '@/components/ChatWindow/MorseChat';
import Layout from '@/components/Layout/Layout';

const Morse: NextPage = () => {
    return (
        <Layout>
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-4">
                        <MorseChat />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Morse;
