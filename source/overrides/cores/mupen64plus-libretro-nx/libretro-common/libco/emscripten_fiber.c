/*
  libco.emscripten (2020-02-27)
  authors: Toad King
  license: public domain
*/

#define LIBCO_C
#include <libco.h>
#include <stdlib.h>
#include <stddef.h>
#include <malloc.h>
#include <emscripten/fiber.h>

#define ASYNCIFY_STACK_SIZE (32768)

static thread_local emscripten_fiber_t *co_active_;

static void co_thunk(void *coentry)
{
   ((void (*)(void))coentry)();
}

static void co_init(void)
{
   if (!co_active_)
   {
      emscripten_fiber_t *co_primary = calloc(1, sizeof(emscripten_fiber_t));
      void *asyncify_stack = malloc(ASYNCIFY_STACK_SIZE);

      emscripten_fiber_init_from_current_context(co_primary, asyncify_stack, ASYNCIFY_STACK_SIZE);
      co_active_ = co_primary;
   }
}

cothread_t co_active(void)
{
   co_init();
   return co_active_;
}

cothread_t co_create(unsigned int stacksize, void (*coentry)(void))
{
   co_init();

   emscripten_fiber_t *fiber = calloc(1, sizeof(emscripten_fiber_t));
   void *asyncify_stack = malloc(ASYNCIFY_STACK_SIZE);
   void *c_stack = memalign(16, stacksize);
   emscripten_fiber_init(fiber, co_thunk, coentry, c_stack, stacksize, asyncify_stack, ASYNCIFY_STACK_SIZE);

   return (cothread_t)fiber;
}

void co_delete(cothread_t cothread)
{
   free(cothread);
}

void co_switch(cothread_t cothread)
{
   emscripten_fiber_t *old_fiber = co_active_;
   co_active_ = (emscripten_fiber_t *)cothread;

   emscripten_fiber_swap(old_fiber, co_active_);
}
