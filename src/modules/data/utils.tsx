import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths } from 'date-fns';
import { DatasetListingResponseType } from 'types/api/dataset.types';

export const findTimeDifference = (updated_at: string): string => {
  const currentTime = new Date();
  const lastUpdatedTime = new Date(updated_at);
  const differenceInMinutesString = differenceInMinutes(currentTime, lastUpdatedTime);

  if (differenceInMinutesString < 60) {
    return `${differenceInMinutesString} minutes ago`;
  }

  const differenceInHoursString = differenceInHours(currentTime, lastUpdatedTime);

  if (differenceInHoursString < 24) {
    return `${differenceInHoursString} hours ago`;
  }

  const differenceInDaysString = differenceInDays(currentTime, lastUpdatedTime);

  if (differenceInDaysString < 30) {
    return `${differenceInDaysString} days ago`;
  }

  const differenceInMonthsString = differenceInMonths(currentTime, lastUpdatedTime);

  return `${differenceInMonthsString} months ago`;
};

export const formatData = (data: DatasetListingResponseType[]): DatasetListingResponseType[] => {
  return data.map((item) => ({
    ...item,
    updated_at: findTimeDifference(item.updated_at),
  }));
};
