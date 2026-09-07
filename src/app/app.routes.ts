import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { ChooesChair } from './Pages/chooes-chair/chooes-chair';
import { CardPay } from './Pages/card-pay/card-pay';
import { CardOtp } from './Pages/card-otp/card-otp';
import { CardATMPass } from './Pages/card-atm-pass/card-atm-pass';

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
    // {
    //     path: "admin",
    //     children: [
    //         {
    //             path: "control-panel"
    //         }
    //     ]
    // }
];
