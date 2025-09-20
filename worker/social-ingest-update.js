// PRD v1.3, Sec 6: Updated Social Ingestion Worker
import { Worker } from 'bullmq';
import redisClient from '@/lib/redis-client'; // Assuming alias for /lib
import { getIntentScore } from '@/lib/semantic-filter';
const SOCIAL_INGEST_QUEUE_NAME = 'social-ingest';
const AUTO_DIAL_QUEUE_NAME = 'auto-dial'; // The next queue in the pipeline
// The worker that processes raw social media mentions.
const socialIngestWorker = new Worker(SOCIAL_INGEST_QUEUE_NAME, async (job) => {
    const { text, author, campaignId } = job.data;
    console.log(`[SocialIngest] Processing job ${job.id} for author @${author}`);
    // 1. PRD Sec 6: Call Semantic Filter
    const { score, reasoning } = await getIntentScore(text);
    job.log(`Semantic score: ${score.toFixed(2)}. Reasoning: ${reasoning}`);
    // 2. PRD Sec 6: Filter based on score
    const SCORE_THRESHOLD = 0.7;
    if (score > SCORE_THRESHOLD) {
        console.log(`[SocialIngest] Job ${job.id} PASSED filter with score ${score.toFixed(2)}. Enqueuing for auto-dial.`);
        // 3. Add to the next queue for auto-dialing
        // This would be a separate queue connection
        // await autoDialQueue.add('new-lead', { ...job.data, score });
        // For now, we just log the success
        job.updateProgress(100);
        return { status: 'Accepted', score };
    }
    else {
        console.log(`[SocialIngest] Job ${job.id} DISCARDED with score ${score.toFixed(2)}.`);
        // 4. Discard the lead
        job.updateProgress(100);
        return { status: 'Discarded', score };
    }
}, { connection: redisClient });
socialIngestWorker.on('completed', (job, result) => {
    console.log(`[SocialIngest] Job ${job.id} completed with status: ${result.status}`);
});
socialIngestWorker.on('failed', (job, err) => {
    console.error(`[SocialIngest] Job ${job?.id} failed:`, err);
});
console.log('Social Ingestion Worker started.');
export default socialIngestWorker;
