import { FC, Fragment } from 'react';
import { MapAny } from 'types/commonTypes';

type PropertiesProps = {
  data: MapAny;
};

const Properties: FC<PropertiesProps> = ({ data }) => {
  return (
    <div className='grid grid-cols-2 gap-2.5'>
      {Object.entries(data).map(([key, value]) => (
        <Fragment key={key}>
          <div className='f-12-400 text-GRAY_700 h-6 flex items-center'>
            <p>{key}</p>
          </div>
          <div className='f-11-400 text-GRAY_1000 h-6 flex items-center'>
            <p>{value}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default Properties;
