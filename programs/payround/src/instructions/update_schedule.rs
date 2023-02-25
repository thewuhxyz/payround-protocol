use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Token, TokenAccount};
use clockwork_sdk::state::{Thread, ThreadSettings, Trigger};
use clockwork_sdk::ThreadProgram;

use crate::constants::PAYROUND_SEED;
use crate::state::{PayroundAccount, Task};

#[derive(Accounts)]
// #[instruction(thread_label: String)]
pub struct UpdateSchedule<'info> {
    pub system_program: Program<'info, System>,

    /// Clockwork Program (Thread Program)
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, ThreadProgram>,

    pub authority: Signer<'info>,

    pub task: Box<Account<'info, Task>>,

    /// Who's paying
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Address to assign to the newly created Thread
    // #[account(mut, address = Thread::pubkey(payround_account.key(), task.key()))]
    #[account(mut)]
    pub thread: Box<Account<'info, Thread>>,

    /// Thread Admin, not signer but it will be use to pseudo-sign by the driver program
    pub payround_account: Box<Account<'info, PayroundAccount>>, // * will be the thread authority

    #[account(mut)]
    pub account_ata: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub recipient_ata: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,

    pub rent: Sysvar<'info, Rent>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> UpdateSchedule<'info> {
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

pub fn handler(ctx: Context<UpdateSchedule>, schedule: String, skippable: bool) -> Result<()> {
    let trigger = Trigger::Cron {
        schedule,
        skippable,
    };

    let thread_settings: ThreadSettings = ThreadSettings {
        fee: None,
        kickoff_instruction: None,
        rate_limit: None,
        trigger: Some(trigger),
    };

    clockwork_sdk::cpi::thread_update(
        ctx.accounts.into_update_task_context().with_signer(&[&[
            ctx.accounts.payround_account.authority.key().as_ref(),
            PAYROUND_SEED.as_ref(),
            &[ctx.accounts.payround_account.bump],
        ]]),
        thread_settings,
    )?;

    Ok(())
}
