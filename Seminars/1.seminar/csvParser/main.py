import os

import pandas as pd

if __name__ == '__main__':
    for i in range(2011, 2019):
        year = str(i)
        if not os.path.exists(year):
            os.makedirs(year)
        df = pd.read_csv(r'{}.csv'.format(year), encoding='utf8')
        df = df[['FL_DATE', 'ORIGIN', 'DEST', 'CRS_DEP_TIME', 'CRS_ARR_TIME', 'ARR_DELAY']]
        df[["YEAR", "MONTH", "DAY"]] = df["FL_DATE"].str.split("-", expand=True)
        df = df.drop('FL_DATE', axis=1)
        df["CRS_DEP_TIME"] = df.CRS_DEP_TIME.map("{:04}".format)
        df["CRS_ARR_TIME"] = df.CRS_ARR_TIME.map("{:04}".format)
        df['CRS_DEP_TIME'] = df['CRS_DEP_TIME'].astype(str).str[:2] + ':' + df['CRS_DEP_TIME'].astype(str).str[2:]
        df['CRS_ARR_TIME'] = df['CRS_ARR_TIME'].astype(str).str[:2] + ':' + df['CRS_ARR_TIME'].astype(str).str[2:]
        df['ARR_DELAY'] = df['ARR_DELAY'].abs()
        df['ARR_DELAY'] = df['ARR_DELAY'].fillna(0)
        df['ARR_DELAY'] = df['ARR_DELAY'].astype(int)
        months = [group for _, group in df.groupby(pd.Grouper(key='MONTH'))]

        for month in range(0, len(months)):
            months[month].to_csv(year + '/' + str(month + 1) + '.csv', index=False)
