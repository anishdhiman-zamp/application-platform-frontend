//Reference : https://levelup.gitconnected.com/polling-in-javascript-ab2d6378705a

import { useEffect, useRef } from 'react';
import { MapAny } from 'types/commonTypes';

export const POLLING_ERROR = 'Exceeded max attempts';

/**
 * Hook to facilitate polling
 * @returns functions to start and stop polling
 */

const usePolling = () => {
  const pollingTimer = useRef<ReturnType<typeof setTimeout>>();
  const pollingFlag = useRef<boolean>();

  pollingFlag.current = true;

  const clearTimer = () => {
    if (pollingTimer) clearTimeout(pollingTimer.current);
  };

  /**
   * A higher-order function that returns a function, executePoll
   * @param fn - function that will be executed over a given interval. Typically this will be an API request
   * @param validate - function where we define a test/check to see if the data matches what we want, which will end the poll
   * @param interval - time to wait between poll requests
   * @param maxAttempts - upper bound for the number of poll requests, to prevent it from running infinitely
   * @returns executePoll
   */
  const startPolling = ({
    fn,
    validate,
    interval = 0,
    maxAttempts = 0,
    pollTillSuccess = false,
  }: {
    fn: any;
    validate: (res: any) => boolean;
    interval: number;
    maxAttempts: number;
    pollTillSuccess?: boolean;
  }) => {
    pollingFlag.current = true;

    let attempts = 0;

    /**
     * A function that will run recursively until a stopping condition is met
     *  stopping conditions : validation is truthy or maxAttempts exceeded or pollingFlag is unset
     * @param resolve
     * @param reject
     * @returns promise
     */
    const executePoll = async (resolve: (val: MapAny) => void, reject: (val: MapAny) => void) => {
      try {
        const result = await fn()?.unwrap();

        attempts++;

        if (validate?.(result)) {
          return resolve(result);
        } else if (maxAttempts && attempts === maxAttempts) {
          return reject({ error: POLLING_ERROR });
        } else {
          clearTimer();
          if (pollingFlag.current) pollingTimer.current = setTimeout(executePoll, interval, resolve, reject);
        }
      } catch (err) {
        if (err && pollTillSuccess) {
          clearTimer();
          if (pollingFlag.current) pollingTimer.current = setTimeout(executePoll, interval, resolve, reject);
        } else return reject({ error: POLLING_ERROR });
      }
    };

    return new Promise(executePoll);
  };

  /**
   * Function to stop polling
   */
  const stopPolling = () => {
    clearTimer();
    pollingFlag.current = false;
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return { startPolling, stopPolling };
};

export default usePolling;
