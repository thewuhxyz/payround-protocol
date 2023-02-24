pub mod state;
pub mod instructions;
pub mod constants;

use anchor_lang::prelude::*;
use instructions::*;

use {
    clockwork_sdk::{
        state::{Thread, ThreadAccount, ThreadResponse},
    },
};

declare_id!("BQpMmaGZ9wgYvUQGcBarTr3puuDid1W3tUj7Fz3pWUkV");

#[program]
pub mod payround {

    use clockwork_sdk::state::ThreadResponse;

    use super::*;

    pub fn create_email_account (ctx: Context<CreateEmailAccount>, user_id: String) -> Result<()> {
        instructions::create_email_account::handler(ctx, user_id)   
    }
    
    pub fn close_email_account (ctx: Context<CloseEmailAccount>) -> Result<()> {
        instructions::close_email_account::handler(ctx)   
    }

    pub fn create_degen_account ( ctx: Context<CreateDegenAccount>) -> Result<()> {
        instructions::create_degen_account::handler(ctx)
    }
    
    pub fn close_degen_account ( ctx: Context<CloseDegenAccount>) -> Result<()> {
        instructions::close_degen_account::handler(ctx)
    }

    pub fn create_task (ctx: Context<CreateTask>, amount: u64, desc: String) -> Result<()> {
        instructions::create_task::handler(ctx, amount, desc)
    }

    pub fn create_task_group (ctx: Context<CreateTaskGroup>, desc: String) -> Result<()> {
        instructions::create_task_group::handler(ctx, desc)
    }

    pub fn process_task (ctx: Context<ProcessTask>) -> Result<ThreadResponse> {
        instructions::process_task::handler(ctx)
    }
    
    pub fn process_task_test_ix (ctx: Context<ProcessTaskTest>) -> Result<()> {
        instructions::process_task_test_ix::handler(ctx)
    }

    pub fn hello_world(
        ctx: Context<HelloWorld>,
        name: String,
    ) -> Result<clockwork_sdk::state::ThreadResponse> {
        // hello_world::handler(ctx, name)
        handler(ctx, name)
    }
}


#[derive(Accounts)]
#[instruction(name: String)]
pub struct HelloWorld<'info> {
    #[account(address = hello_thread.pubkey(), signer)]
    pub hello_thread: Account<'info, Thread>,
}

pub fn handler(_ctx: Context<HelloWorld>, name: String) -> Result<ThreadResponse> {
    msg!(
        "Hello {}! The current time is: {}",
        name,
        Clock::get().unwrap().unix_timestamp
    );

    Ok(ThreadResponse::default())
}

