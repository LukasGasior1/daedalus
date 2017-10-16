// @flow
import { getEtcSyncProgress } from './getEtcSyncProgress';
import { Logger, stringifyData, stringifyError } from '../../lib/logger';
import { GenericApiError } from '../common';
import { getEtcAccounts } from './getEtcAccounts';
import { getEtcAccountBalance } from './getEtcAccountBalance';
import type { GetSyncProgressResponse } from '../common';
import type { GetEtcSyncProgressResponse } from './getEtcSyncProgress';
import type { GetEtcAccountsResponse } from './getEtcAccounts';
import type { GetEtcAccountBalanceResponse } from './GetEtcAccountBalanceResponse';

/**
 * The ETC api layer that handles all requests to the
 * mantis client which is used as backend for ETC blockchain.
 */

export const ETC_API_HOST = 'ec2-52-30-28-57.eu-west-1.compute.amazonaws.com';
export const ETC_API_PORT = 8546;

export default class EtcApi {

  async getSyncProgress(): Promise<GetSyncProgressResponse> {
    Logger.debug('EtcApi::getSyncProgress called');
    try {
      const response: GetEtcSyncProgressResponse = await getEtcSyncProgress();
      Logger.debug('EtcApi::getSyncProgress success: ' + stringifyData(response));
      return {
        localDifficulty: response.result ? parseInt(response.result.currentBlock, 16) : 100,
        networkDifficulty: response.result ? parseInt(response.result.highestBlock, 16) : 100,
      };
    } catch (error) {
      Logger.error('EtcApi::getSyncProgress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  getAccounts = async () => {
    Logger.debug('EtcApi::getAccounts called');
    try {
      const response: GetEtcAccountsResponse = await getEtcAccounts();
      Logger.debug('EtcApi::getAccounts success: ' + stringifyData(response));
      const accounts = response.result;
      return Promise.all(accounts.map(async (id) => ({
        id,
        balance: await this.getAccountBalance(id),
      })));
    } catch (error) {
      Logger.error('EtcApi::getAccounts error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  };

  async getAccountBalance(accountId) {
    Logger.debug('EtcApi::getAccountBalance called');
    try {
      const response: GetEtcAccountBalanceResponse = await getEtcAccountBalance([accountId, 'latest']);
      Logger.debug('EtcApi::getAccountBalance success: ' + stringifyData(response));
      return parseInt(response.result, 16);
    } catch (error) {
      Logger.error('EtcApi::getAccountBalance error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

}