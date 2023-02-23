pub mod state;
pub mod instructions;
pub mod constants;

use anchor_lang::prelude::*;
use instructions::*;

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
}
