import CustomerComponent from "component/AccountComponent/AccountComponentUser/AccountComponentUser";
import AddAccount from "modal/Account/AddAccount/AddAccount";

const UserAccount: React.FC = () => {
  return (
    <div className="wrapper">
      <AddAccount id="Modal Account User" />
      <CustomerComponent />
    </div>
  )
}

export default UserAccount;