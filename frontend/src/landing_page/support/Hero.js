function Hero() {
  return (
    <section className="container-fluid" id="supportHero">
      <div className="p-3" id="supportWrapper">
        <h4 className="mt-5 fs-3">Support Portal</h4>
        <a className="mt-5 fs-5" href="/support">Track Tickets</a>
      </div>
      <div className="row p-3 m-3 ">
        <div className="col-6 p-3">
          <input
            placeholder="Eg: how do i activate F&O, why is my order getting rejected ..."
          />
          <div className="mt-4">
          <a href="/support">Track account opening</a>
          <a href="/support">Track segment activation</a>
          <a href="/support">Intraday margins</a>
          <br/>
          <a href="/support">Kite user manual </a>
          </div>
        </div>
        <div className="col-6 p-5 mt-2 mb-4">
          <h1 className="fs-3 mb-3">Featured</h1>
          <ol>
            <li>
              {" "}
              <a href="/support">Quarterly Settlement of Funds - July 2025</a>{" "}
            </li>
            <br/>
            <li>
              <a href="/support">
                Exclusion of F&O contracts on 8 securities from August 29, 2025
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
