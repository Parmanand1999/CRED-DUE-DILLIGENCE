import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CustomLoader from '@/components/common/CustomLoader';
import QcCaseHeader from './Components/QcCaseHeader';
import { viewQCCaseDetails } from '@/Services/QCService';
import CategoryAccordion from './Components/CategoryAccordion';
import CaseHistoryLog from './Components/CaseHistoryLog';



const QcReviewAndConfirm = () => {
    const param = useParams();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpenHistory, setIsOpenHistory] = useState(false);
    useEffect(() => {
        fetchCaseDetails();
    }, []);
    console.log(caseData, "caseData in review and confirm");

    const fetchCaseDetails = async () => {
        setLoading(true);
        try {
            const res = await viewQCCaseDetails(`${param?.caseId}`);
            if (res.status === 200) {
                setCaseData(res.data.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading && <CustomLoader />}
            <QcCaseHeader caseId={caseData?.case?.caseId} setLoading={setLoading} />

            <div className='mt-5'>
                <p className='text-sm text-textsecondary'>Please review the details of the case and confirm that all information is accurate before proceeding.</p>
            </div>

            {/* Split Layout Container */}
            <div className={`mt-5 flex gap-4 transition-all duration-300 ${isOpenHistory ? 'h-[600px]' : ''}`}>


                {/* Accordion Panel - 60% when history is open, 100% when closed */}
                <div className={`flex-1 overflow-y-auto ${isOpenHistory ? 'w-[60%]' : 'w-full'} space-y-2`}>
                    {caseData?.services && caseData?.services?.length > 0 ? (
                        caseData.services.map((caseDetail, index) => (
                            <CategoryAccordion
                                key={index}
                                caseDetail={caseDetail}
                                fetchCaseDetails={fetchCaseDetails}
                                setIsOpenHistory={setIsOpenHistory}
                            />
                        ))
                    ) : (
                        <div className='p-4 text-center text-gray-500'>
                            No services available
                        </div>
                    )}
                </div>
                {/* History Panel - 40% width when open */}
                {isOpenHistory && (
                    <div className='w-[40%] flex-shrink-0'>
                        <CaseHistoryLog caseData={caseData} loading={loading} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default QcReviewAndConfirm