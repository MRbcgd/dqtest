#include <stdio.h>
#include <stdlib.h>

#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <sys/shm.h>

#include <errno.h>

int main(int argc, char** argv)
{
   {
      int qid;
      int qkey;

      char buffer[4096];

      if( argc <2 ) {
         printf("%s [Qkey]\n", argv[0]);
         return 0;
      }   

      qkey = atoi(argv[1]);

      qid = msgget(qkey, 0666|IPC_CREAT);
      if( qid < 0 ) {
         printf("msgget err.. %d\n", errno);
         return 0;
      }

      msgrcv(qid, buffer, sizeof(buffer), 0, IPC_NOWAIT);
   }
   {
      int mid;
      int msize;
      int mkey;

      mkey = atoi(argv[1]);
      msize = 4096;

      mid = shmget(mkey, msize, 0666|IPC_CREAT);
      if( mid < 0 ) {
         printf("shmget error.. %d\n", errno);
         return 0;
      }

      shmat(mid, NULL, 0);
   }
}
