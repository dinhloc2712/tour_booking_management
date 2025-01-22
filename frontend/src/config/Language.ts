import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import TOUR_VI from 'component/locales/VI/tour.json'
import TOUR_EN from 'component/locales/EN/tour.json'
import VOUCHER_VI from 'component/locales/VI/voucher.json'
import VOUCHER_EN from 'component/locales/EN/voucher.json'
import SERVICE_VI from 'component/locales/VI/service.json'
import SERVICE_EN from 'component/locales/EN/service.json'
import USER_VI from 'component/locales/VI/user.json'
import USER_EN from 'component/locales/EN/user.json'
import SOURCE_VI from 'component/locales/VI/source.json'
import SOURCE_EN from 'component/locales/EN/source.json'
import BOOKING_VI from 'component/locales/VI/booking.json'
import BOOKING_EN from 'component/locales/EN/booking.json'
import BRANCH_VI from 'component/locales/VI/branch.json'
import BRANCH_EN from 'component/locales/EN/branch.json'
import BUTTON_EN from 'component/locales/EN/button.json'
import BUTTON_VI from 'component/locales/VI/button.json'
import STATISTICAL_EN from 'component/locales/EN/Statistical.json'
import STATISTICAL_VI from 'component/locales/VI/Statistical.json'
const resources = {
    en: {
        tour: TOUR_EN,
        voucher: VOUCHER_EN,
        AddVoucher:VOUCHER_EN,
        UpdateVoucher:VOUCHER_EN,
        Addtour:TOUR_EN,

        service: SERVICE_EN,
        AddService:SERVICE_EN,
        UpdateService:SERVICE_EN,
        label: SERVICE_EN,

        user: USER_EN,
        Adduser:USER_EN,
        Updateuser:USER_EN,

        source: SOURCE_EN,
        Addsource:SOURCE_EN,
        Updatesource:SOURCE_EN,

        booking: BOOKING_EN,
        status: BOOKING_EN,
        form:BOOKING_EN,
        Home:BOOKING_EN,
        TableBills:BOOKING_EN,
        checkin:BOOKING_EN,


        branch: BRANCH_EN,
        AddBranch:BRANCH_EN,
        UpdateBranch:BRANCH_EN,
    
        button:BUTTON_EN,

        Statistical:STATISTICAL_EN,
        Statisticaltable:STATISTICAL_EN,
        Statisticaltable1:STATISTICAL_EN,
        StatisticaltableBill:STATISTICAL_EN,
        Table:STATISTICAL_EN,
        Table1:STATISTICAL_EN,
        Sale:STATISTICAL_EN,
        Servicer:STATISTICAL_EN,
        Tour:STATISTICAL_EN,
        Bills:STATISTICAL_EN,
        
    },
    vi: {
        tour: TOUR_VI,
        voucher: VOUCHER_VI,
        AddVoucher:VOUCHER_VI,
        UpdateVoucher:VOUCHER_VI,
        Addtour:TOUR_VI,

        service: SERVICE_VI,
        AddService:SERVICE_VI,
        UpdateService:SERVICE_VI,
        label: SERVICE_VI,

        user: USER_VI,
        Adduser:USER_VI,
        Updateuser:USER_VI,

        source: SOURCE_VI,
        Addsource:SOURCE_VI,
        Updatesource:SOURCE_VI,

        booking: BOOKING_VI,
        status: BOOKING_VI,
        form: BOOKING_VI,
        Home:BOOKING_VI,
        TableBills:BOOKING_VI,
        checkin:BOOKING_VI,

        branch: BRANCH_VI,
        AddBranch:BRANCH_VI,
        UpdateBranch:BRANCH_VI,
    
        button:BUTTON_VI,

        Statistical:STATISTICAL_VI,
        Statisticaltable:STATISTICAL_VI,
        Statisticaltable1:STATISTICAL_VI,
        StatisticaltableBill:STATISTICAL_VI,
        Table:STATISTICAL_VI,
        Table1:STATISTICAL_VI,
        Sale:STATISTICAL_VI,
        Servicer:STATISTICAL_VI,
        Tour:STATISTICAL_VI,
        Bills:STATISTICAL_VI,
    },
}

i18n.use(initReactI18next).init({
    resources,
    lng: 'vi',
    ns: ['tour', 'voucher', 'service', 'user', 'booking', 'branch','button'],
    fallbackLng: 'vi',
    interpolation: {
        escapeValue: false
    }
})

export default i18n;