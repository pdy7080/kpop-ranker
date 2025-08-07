export default function Custom500() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, rgb(127, 29, 29), rgb(131, 24, 67), rgb(88, 28, 135))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>500</h1>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'rgb(251, 207, 232)',
            marginBottom: '1rem'
          }}>
            서버 오류
          </h2>
          <p style={{
            color: 'rgb(249, 168, 212)',
            marginBottom: '2rem'
          }}>
            서버에서 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
        <div>
          <a
            href="/"
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: 'rgb(220, 38, 38)',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}