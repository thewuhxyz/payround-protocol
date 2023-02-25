pub mod create_degen_account;
pub mod create_email_account;
// pub mod close_degen_account;
pub mod close_account;
pub mod create_task;
pub mod create_task_group;
pub mod process_task;
pub mod process_task_test_ix;
pub mod start_task;
pub mod end_task;
pub mod pause_task;
pub mod resume_task;
pub mod credit_task;
pub mod delete_task;
pub mod update_schedule;
pub mod update_task;
pub mod change_task_group;
pub mod withdraw_credit;

// todo: Credit Tasks ✅
// todo: Start Tasks - create thread ✅
// todo: Stop Tasks - stop thread ✅
// todo: Resume Task - resume thread ✅
// todo: Hold Tasks - pause thread ✅
// todo: Delete Tasks - delete thread ✅
// todo: Withdraw Credit - withdraw thread ✅
// todo: update frequency - update thread ✅
// todo: change task group ✅


pub use create_email_account::*;
pub use close_account::*;
pub use create_degen_account::*;
// pub use close_degen_account::*;
pub use create_task::*;
pub use create_task_group::*;
pub use process_task::*;
pub use process_task_test_ix::*;
pub use start_task::*;
pub use end_task::*;
pub use pause_task::*;
pub use resume_task::*;
pub use credit_task::*;
pub use delete_task::*;
pub use update_schedule::*;
pub use update_task::*;
pub use change_task_group::*;
pub use withdraw_credit::*;
