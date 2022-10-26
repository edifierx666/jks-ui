import PQueue from "p-queue"
export const queue = new PQueue({
  autoStart:true,
  concurrency:10
});


export const jobQ = new PQueue({
  autoStart: true,
})
