use anchor_lang::prelude::*;
use clockwork_sdk::state::{Thread, ThreadSettings, ThreadAccount };
use clockwork_sdk::ThreadProgram;

use crate::error::ErrorCode;
use crate::constants::PAYROUND_SEED;
use crate::state::{PayroundAccount, Task, TaskOptions};

#[derive(Accounts)]
// #[instruction(thread_label: String)]
pub struct UpdateTaskDetails<'info> {
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    pub authority: Signer<'info>,

    #[account(
      mut,
      has_one=authority,
      has_one=thread,
      constraint=task.account==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub task: Box<Account<'info, Task>>,

    #[account(
        mut, 
        address=thread.pubkey(),
        constraint=thread.pubkey()==task.thread @ ErrorCode::KeysDontMatch, 
        constraint=thread.authority==payround_account.key() @ ErrorCode::KeysDontMatch
    )]
    pub thread: Box<Account<'info, Thread>>,

    pub user_id: SystemAccount<'info>,

    #[account(
        mut,
        seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
        bump=payround_account.bump,
        has_one=authority,
        has_one=user_id
    )]
    pub payround_account: Box<Account<'info, PayroundAccount>>,

    #[account(address = anchor_lang::system_program::ID)]
    pub system_program: Program<'info, System>,
}

impl<'info> UpdateTaskDetails<'info> {
    fn into_update_task_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, clockwork_sdk::cpi::ThreadUpdate<'info>> {
        let cpi_accounts = clockwork_sdk::cpi::ThreadUpdate {
            authority: self.payround_account.to_account_info(),
            system_program: self.system_program.to_account_info(),
            thread: self.thread.to_account_info(),
        };
        let cpi_program = self.clockwork_program.to_account_info();

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn handler(ctx: Context<UpdateTaskDetails>, task_options: TaskOptions) -> Result<()> {

    if let Some(amount) = task_options.amount {
        ctx.accounts.task.update_amount(amount);
    };

    if let Some(trigger) =  task_options.schedule_options {

        // let trigger = Trigger::Cron {
        //     schedule: schedule.freq.clone(),
        //     skippable: schedule.skippable,
        // };
        let trigger = trigger;
        let thread_settings: ThreadSettings = ThreadSettings {
            fee: None,
            rate_limit: None,
            trigger: Some(trigger.clone().into()),
            instructions: None,
            name: None
        };

        clockwork_sdk::cpi::thread_update(
            ctx.accounts.into_update_task_context().with_signer(&[&[
                ctx.accounts.payround_account.user_id.key().as_ref(),
                PAYROUND_SEED.as_ref(),
                &[ctx.accounts.payround_account.bump],
            ]]),
            thread_settings,
        )?;

        ctx.accounts.task.update_trigger(trigger)
    }
    Ok(())
}
