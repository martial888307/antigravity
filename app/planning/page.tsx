'use client';

import Layout from '@/components/Layout';
import PlanningContainer from '@/components/planning/PlanningContainer';

export default function PlanningPage() {
    return (
        <Layout>
            <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0">
                    <PlanningContainer />
                </div>
            </div>
        </Layout>
    );
}
