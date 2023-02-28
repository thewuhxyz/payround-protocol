pub mod state;
pub mod instructions;
pub mod constants;
pub mod error;

use anchor_lang::prelude::*;
use instructions::*;
use state::*;
use clockwork_sdk::state::ThreadResponse;

declare_id!("BQpMmaGZ9wgYvUQGcBarTr3puuDid1W3tUj7Fz3pWUkV");

#[program]
pub mod payround {

    use super::*;

    pub fn create_email_account (ctx: Context<CreateEmailAccount>, bump: u8, desc: String) -> Result<()> {
        instructions::create_email_account::handler(ctx, bump, desc)   
    }
    
    pub fn create_degen_account ( ctx: Context<CreateDegenAccount>, bump: u8, desc: String) -> Result<()> {
        instructions::create_degen_account::handler(ctx, bump, desc)
    }
    
    pub fn close_payround_account ( ctx: Context<ClosePayroundAccount>) -> Result<()> {
        instructions::close_account::handler(ctx)
    }

    pub fn create_task (ctx: Context<CreateTask>, amount: u64, desc: String, freq: String, skippable: bool) -> Result<()> {
        instructions::create_task::handler(ctx, amount, desc, freq, skippable)
    }

    pub fn create_task_group (ctx: Context<CreateTaskGroup>, desc: String) -> Result<()> {
        instructions::create_task_group::handler(ctx, desc)
    }

    pub fn process_task (ctx: Context<ProcessTask>) -> Result<ThreadResponse> {
        instructions::process_task::handler(ctx)
    }
    
    pub fn start_task (ctx: Context<StartTask>) -> Result<()> {
        instructions::start_task::handler(ctx)
    }
    
    pub fn pause_task (ctx: Context<PauseTask>) -> Result<()> {
        instructions::pause_task::handler(ctx)
    }
    
    pub fn resume_task (ctx: Context<ResumeTask>) -> Result<()> {
        instructions::resume_task::handler(ctx)
    }
    
    pub fn end_task (ctx: Context<EndTask>) -> Result<()> {
        instructions::end_task::handler(ctx)
    }
    
    pub fn delete_task (ctx: Context<DeleteTask>) -> Result<()> {
        instructions::delete_task::handler(ctx)
    }
    
    pub fn update_task_details (ctx: Context<UpdateTaskDetails>, task_options: TaskOptions) -> Result<()> {
        instructions::update_task_details::handler(ctx, task_options)
    }

    pub fn withdraw_task_credit (ctx: Context<WithdrawCredit>, amount: u64) -> Result<()> {
        instructions::withdraw_credit::handler(ctx, amount)
    }
    
    pub fn credit_task (ctx: Context<CreditTask>, amount: u64) -> Result<()> {
        instructions::credit_task::handler(ctx, amount)
    }
    
    pub fn change_task_group (ctx: Context<ChangeTaskGroup>) -> Result<()> {
        instructions::change_task_group::handler(ctx)
    }

}

