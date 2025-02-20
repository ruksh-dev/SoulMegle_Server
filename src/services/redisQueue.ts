import Queue from 'bull';
import {processMatchMaking} from './processMatchMaking'
export const matchMakingQueue=new Queue('matchMaking','redis://localhost:6379')

matchMakingQueue.process(async(job)=>{
    try{
        const userId=job.data.userId;
        await processMatchMaking(userId)
    }catch(err){
        console.log(err)
    }
})

export const addToMatchMakingQueue=async(userId:string)=>{
    try{
        await matchMakingQueue.add({userId})
    }catch(err){
        throw err;
    }
}
export const cleanQueue = async () => {
    try {
        await matchMakingQueue.empty();
        console.log('Queue cleaned successfully');
    } catch (error) {
        console.error('Error cleaning queue:', error);
    }
};

export default matchMakingQueue;
