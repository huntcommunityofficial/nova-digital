export default function bg(){
    return(
        <>
          <div
    className="absolute inset-0 blur-[120px] opacity-60 pointer-events-none"
    style={{
      background: `
        radial-gradient(circle at 25% 30%, #3A8CFF33 0%, transparent 60%),
        radial-gradient(circle at 75% 70%, #8E4BFF33 0%, transparent 60%)
      `,
    }}
  />
  <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none" />
        </>
    );  
};