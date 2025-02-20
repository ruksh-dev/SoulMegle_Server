import Redis from 'ioredis';
import pc from '../utils/vectorDb/index'
export const redis=new Redis()

export const addUserSocketId=async(userId:string,socketId:string)=>{
    try{
        await redis.hset('userSocketId',`${userId}`,socketId)
    }catch(err){
        throw err;
    }
}

export const getUserSocketId=async(userId:string)=>{
    try{
        const socketId=await redis.hget('userSocketId',`${userId}`)
        return socketId;
    }catch(err){
        throw err;
    }
}

export const removeUserSocketId=async(userId:string)=>{
    try{
        await redis.hdel('userSocketId',`${userId}`)
    }catch(err){
        throw err;
    }
}

export const addUserEmbedding=async(userId:any)=>{
    try{
        const UserInterestsIndex=pc.index('user-interests')
        const response = await UserInterestsIndex.fetch(userId);
        const vectorEmbedding = response.records[`${userId}`].values
        console.log(vectorEmbedding)
        await redis.hset('userEmbedding',`${userId}`,JSON.stringify(vectorEmbedding))
    }catch(err){
        throw err;
    }
}

export const removeUserEmbedding=async(userId:string)=>{
    try{
        await redis.hdel('userEmbedding',`${userId}`)
    }catch(err){
        throw err;
    }
}

export const getAllUserEmbedding=async()=>{
    try{
        const userEmbeddings=await redis.hgetall('userEmbedding')
        return userEmbeddings;
    }catch(err){
        throw err;
    }
}

export const addUserToQueue=async(userId:string)=>{
    try{
        await redis.rpush('userQueue',userId)
    }catch(err){
        throw err;
    }
}

export const removeUserFromQueue=async(userId:string)=>{
    try{
        await redis.lrem('userQueue',0,userId)
    }catch(err){
        throw err;
    }
}



