import AccountComponent from "component/AccountComponent/AccountComponentEmployee/AccountComponentEmployee";
import AddAccount from "modal/Account/AddAccount/AddAccount";



const EmployeeAccount:React.FC = () => {
  return (
    <div className='wrapper'>
      <AddAccount id='Modal Account Employee'/>
      <AccountComponent />
    </div>
  )
}
export default EmployeeAccount;