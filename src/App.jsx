import "./App.css";
import { FormControl, InputGroup, Container, Button, Row, Card, Navbar } from "react-bootstrap";
import { useState, useEffect } from "react";
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [releaseFilter, setReleaseFilter] = useState("All");
  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };
    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });
  }, []);

  async function search() {
    const artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    const artistID = await fetch(
      `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
      artistParams
    )
      .then(res => res.json())
      .then(data => data.artists.items[0]?.id);

    if (!artistID) return alert("Artist not found!");

    const albumsData = await fetch(
      `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=10`,
      artistParams
    )
      .then(res => res.json())
      .then(data => data.items);

    const albumsWithPreview = await Promise.all(
      albumsData.map(async (album) => {
        const tracksData = await fetch(
          `https://api.spotify.com/v1/albums/${album.id}/tracks?market=US&limit=1`,
          artistParams
        )
          .then(res => res.json())
          .then(data => data.items[0]);

        return {
          ...album,
          preview_url: tracksData?.preview_url || null,
        };
      })
    );

    setAlbums(albumsWithPreview);
  }

  const filteredAlbums = albums.filter((album) => {
    const year = parseInt(album.release_date?.split("-")[0]);
    if (releaseFilter === "Before2010") return year < 2010;
    if (releaseFilter === "2010to2020") return year >= 2010 && year <= 2020;
    if (releaseFilter === "After2020") return year > 2020;
    return true;
  });

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>🎧 AlbumHunt 🎧</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="my-3">
        <InputGroup>
          <FormControl
            placeholder="Search For Artist"
            type="input"
            aria-label="Search for an Artist"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
            style={{
              width: "300px",
              height: "35px",
              border: "1px solid #cc",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>
      <Container className="d-flex justify-content-center my-2">
        <div className="d-flex align-items-center">
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Filter by Release:</label>
          <select
            value={releaseFilter}
            onChange={(e) => setReleaseFilter(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="All">All</option>
            <option value="Before2010">Before 2010</option>
            <option value="2010to2020">2010 - 2020</option>
            <option value="After2020">After 2020</option>
          </select>
        </div>
      </Container>
      <Container>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "center",
          }}
        >
          {filteredAlbums.map((album) => (
            <Card
              key={album.id}
              style={{
                backgroundColor: 'white',
                margin: '10px',
                borderRadius: '5px',
                marginBottom: '30px',
              }}
            >
              <Card.Img
                width={200}
                src={album.images?.[0]?.url}
                style={{ borderRadius: '4%' }}
              />
              <Card.Body>
                <Card.Title
                  style={{
                    whiteSpace: 'wrap',
                    fontWeight: 'bold',
                    maxWidth: '200px',
                    fontSize: '18px',
                    marginTop: '10px',
                    color: 'black',
                  }}
                >
                  {album.name}
                </Card.Title>
                <Card.Text style={{ color: 'black' }}>
                  <div><strong>Release Date:</strong> {album.release_date}</div>
                  <div><strong>Total Tracks:</strong> {album.total_tracks ?? "N/A"}</div>
                  <div><strong>Popularity:</strong> {album.popularity ?? "N/A"}</div>
                </Card.Text>
                <Button
                  href={album.external_urls.spotify}
                  target="_blank"
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderRadius: '5px',
                    padding: '10px',
                  }}
                >
                  Album Link
                </Button>
                {album.preview_url ? (
                  <audio controls src={album.preview_url} style={{ width: '100%' }} />
                ) : (
                  <div className="text-muted mt-2 text-center">
                    <span className="badge bg-secondary">No Preview</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
      <footer className="text-center py-4 text-muted">Built by <a href="https://github.com/Ekshithsai" target="_blank" rel="noreferrer">Ekshith Sai</a> </footer>
    </>
  );
}
export default App;
