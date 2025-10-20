import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import BillsOverviewPage from './bills/BillsOverviewPage';
import RentBillsPage from './bills/RentBillsPage';
import GenericBillPage from './bills/GenericBillPage';
import AllBillsPage from './bills/AllBillsPage';
import { ElectricityIcon, GasIcon, HomeIcon, MaidIcon, OtherIcon, WaterIcon, WifiIcon } from '../components/Icons';
import GenericBillDetailPage from './bills/GenericBillDetailPage';

const BillsPage: React.FC = () => {
  const { page } = useAuth();

  const detailPagePrefix = 'bills-detail_';
  if (page.startsWith(detailPagePrefix)) {
    const billId = page.substring(detailPagePrefix.length);
    return <GenericBillDetailPage billId={billId} />;
  }

  switch (page) {
    case 'bills':
      return <BillsOverviewPage />;
    case 'bills-all':
      return <AllBillsPage />;
    case 'bills-rent':
      return <RentBillsPage />;
    case 'bills-electricity':
      return <GenericBillPage category="Electricity" icon={<ElectricityIcon className="w-8 h-8 text-yellow-500" />} />;
    case 'bills-water':
      return <GenericBillPage category="Water" icon={<WaterIcon className="w-8 h-8 text-blue-500" />} />;
    case 'bills-gas':
      return <GenericBillPage category="Gas" icon={<GasIcon className="w-8 h-8 text-orange-500" />} />;
    case 'bills-wifi':
        return <GenericBillPage category="Wi-Fi" icon={<WifiIcon className="w-8 h-8 text-cyan-500" />} />;
    case 'bills-maid':
        return <GenericBillPage category="Maid" icon={<MaidIcon className="w-8 h-8 text-purple-500" />} />;
    case 'bills-others':
        return <GenericBillPage category="Others" icon={<OtherIcon className="w-8 h-8 text-gray-500" />} />;
    default:
      return <BillsOverviewPage />;
  }
};

export default BillsPage;