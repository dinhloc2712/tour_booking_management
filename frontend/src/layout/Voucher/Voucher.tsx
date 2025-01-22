import VoucherComponent from "component/VoucherComponent/VoucherComponent"
import AddVoucher from "modal/Voucher/AddVoucher"

const Voucher:React.FC = () => {
    return (
        <div className="wrapper">
        <AddVoucher id="Modal Voucher"/>
        <VoucherComponent />
        </div>
    )
}

export default Voucher