import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
// import CaseHeader from '@/features/Client/Review&Confirm/Components/CaseHeader';
// import ReviewContent from './Components/ReviewContent';
import CustomLoader from '@/components/common/CustomLoader';
import { viewCaseDetails } from '@/Services/CasesManagmentServices';
import AgentCaseReviewHeader from './Components/AgentCaseReviewHeader';
import CategoryAccordion from './Components/CategoryAccordion';




const AgentReviewAndConfirm = () => {
  const param = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchCaseDetails();
  }, []);
  console.log(caseData, "caseData in review and confirm");

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const res = await viewCaseDetails(`${param?.caseId}`);
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
      <AgentCaseReviewHeader caseId={caseData?.case?.caseId} setLoading={setLoading} />

      <div className='mt-5'>
        <p className='text-sm text-textsecondary'>Please review the details of the case and confirm that all information is accurate before proceeding.</p>
      </div>
      <div className='mt-5 space-y-2'>

        {caseData?.services && caseData?.services?.length > 0 &&
          caseData.services.map((caseDetail, index) => (
            <CategoryAccordion key={index} caseDetail={caseDetail} fetchCaseDetails={fetchCaseDetails} />
          ))

        }

      </div>
    </div>
  )
}

export default AgentReviewAndConfirm