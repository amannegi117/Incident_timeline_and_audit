export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>© {new Date().getFullYear()} Incident Timeline & Audit Hub</div>
        <div className="footer-links">
          <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
          <a href="/about">About</a>
        </div>
      </div>
    </footer>
  )
}