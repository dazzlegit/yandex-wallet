import * as action from './types';
import { fetchCard } from './cards';
import { fetchTransactions } from './transactions';

import axios from 'axios';

const ROOT_URL = '/api';

/**
* Проводит мобильную транзакцию
* 
* @param {any} transaction 
* @param {any} id 
* @returns 
*/
export const payMobile = (transaction, id) => {
    // формируем транзакцию
    const data = {
        phone: transaction.phoneNumber,
        amount: transaction.sum < 0 ? transaction.sum * -1 : transaction.sum
    };

    return async dispatch => {
        try {
            const response = await axios
                .post(`${ROOT_URL}/cards/${id}/pay`, data, {
                    headers: {
                        authorization: 'JWT ' + localStorage.getItem('token')
                    }
                });

            if (response.status === 201) {
                dispatch({
                    type: action.MOBILE_PAY_SUCCESS,
                    payload: transaction
                });
                dispatch(fetchCard(id));
                dispatch(fetchTransactions(id));
            }
        } catch (response) {
            dispatch({
                type: action.MOBILE_PAY_FAILED,
                payload: {
                    error: response.response.data.message ? response.response.data.message : response.response.data,
                    transaction
                }
            });
            console.log(response.response.data.message ? response.response.data.message : response.response.data);
        }
    }
}

export const repeateMobileTransfer = () => dispatch => dispatch({
    type: action.MOBILE_PAY_REPEAT
});

/**
* Проводит prepaid транзакцию
* 
* @param {any} transaction 
* @param {any} id 
* @returns 
*/
export const payPrepaid = (transaction, id, currentId) => {
    // формируем транзакцию
    const data = {
        to: transaction.to,
        amount: transaction.sum < 0 ? transaction.sum * -1 : transaction.sum
    };

    return async dispatch => {
        try {
            const response = await axios
                .post(`${ROOT_URL}/cards/${id}/transfer`, data, {
                    headers: {
                        authorization: 'JWT ' + localStorage.getItem('token')
                    }
                });

            if (response.status === 201) {
                dispatch({
                    type: action.PREPAID_PAY_SUCCESS,
                    payload: transaction
                });
                dispatch(fetchCard(currentId));
                dispatch(fetchCard(id));

                dispatch(fetchTransactions(currentId));
            }
        } catch (response) {
            dispatch({
                type: action.PREPAID_PAY_FAILED,
                payload: {
                    error: response.response.data.message ? response.response.data.message : response.response.data,
                    transaction
                }
            });
            console.log(response.response.data.message ? response.response.data.message : response.response.data);
        }
    }
}

export const repeatePrepaidTransfer = () => dispatch => dispatch({
    type: action.PREPAID_PAY_REPEAT
});
