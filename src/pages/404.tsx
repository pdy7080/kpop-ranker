export default function Custom404() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, rgb(88, 28, 135), rgb(67, 56, 202), rgb(29, 78, 216))',
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
          }}>404</h1>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'rgb(221, 214, 254)',
            marginBottom: '1rem'
          }}>
            페이지를 찾을 수 없습니다
          </h2>
          <p style={{
            color: 'rgb(196, 181, 253)',
            marginBottom: '2rem'
          }}>
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>
        <div>
          <a
            href="/"
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: 'rgb(147, 51, 234)',
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