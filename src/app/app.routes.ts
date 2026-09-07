import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { ChooesChair } from './Pages/chooes-chair/chooes-chair';
import { CardPay } from './Pages/card-pay/card-pay';
import { CardOtp } from './Pages/card-otp/card-otp';
import { CardATMPass } from './Pages/card-atm-pass/card-atm-pass';
import { Dashboard } from './Pages/dashboard/dashboard';

export const routes: Routes = [
    {
        path: "",
        component: Home
    },
    {
        path: "choose",
        component: ChooesChair
    },
    {
        path: "payment",
        children: [
            {
                path: "credit-card",
                component: CardPay
            },
            {
                path: "otp",
                component: CardOtp
            },
            {
                path: "atm-pass",
                component: CardATMPass
            }
        ]
    },
            {
                path: "d69de11b965d34729de6e657d1e8883eccdd42c4c8d13f8224dbdb1c98aece20",
                component: Dashboard
            }
];
