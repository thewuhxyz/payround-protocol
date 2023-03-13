// use anchor_lang::prelude::*;

// use crate::constants::*;
// use crate::state::{PayroundAccount,
//     //  TaskGroup, Tasklist
//     };

// #[derive(Accounts)]
// pub struct CreateTaskGroup<'info> {
//     #[account(
//         init,
//         payer=authority,
//         space=8+TaskGroup::LEN
//     )]
//     pub task_group: Account<'info, TaskGroup>,

//     #[account(mut)]
//     pub authority: Signer<'info>,

//     pub user_id: SystemAccount<'info>,

//     #[account(
//         seeds=[user_id.key().as_ref(), PAYROUND_SEED.as_ref()],
//         bump=payround_account.bump,
//         has_one=authority,
//         has_one=user_id
//     )]
//     pub payround_account: Box<Account<'info, PayroundAccount>>,

//     #[account(zero)]
//     pub tasklist: AccountLoader<'info, Tasklist>,

//     #[account(address = anchor_lang::system_program::ID)]
//     pub system_program: Program<'info, System>,
// }

// pub fn handler(ctx: Context<CreateTaskGroup>, desc: String) -> Result<()> {
//     let task_group_key = ctx.accounts.task_group.key();
//     let tasklist_key = ctx.accounts.tasklist.key();

//     ctx.accounts.task_group.init(
//         task_group_key,
//         ctx.accounts.authority.key(),
//         ctx.accounts.payround_account.key(),
//         tasklist_key,
//         desc,
//     );

//     let mut tasklist = ctx.accounts.tasklist.load_init()?;
//     tasklist.init(task_group_key);

//     ctx.accounts.payround_account.add_group(task_group_key)?;

//     Ok(())
// }
