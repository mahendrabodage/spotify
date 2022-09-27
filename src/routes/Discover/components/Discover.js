import React, { Component } from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import config from '../../.././config';
import '../styles/_discover.scss';
import axios from 'axios';

export default class Discover extends Component {
  constructor() {
    super();

    this.state = {
      newReleases: [],
      playlists: [],
      categories: []
    };
  }

  async getAuthorizationAndData() {
    const { clientId, clientSecret, authUrl } = config.api;
    const data = 'grant_type=client_credentials';
    const auth_token = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8').toString('base64');

    try { 
      const responseAuth = await axios.post(authUrl, data, {
        headers: {
          'Authorization': `Basic ${auth_token}`,
        }
      });

      if (responseAuth.status === 200) {
        const token = responseAuth.data.access_token;
        const respNewRelese = this.getRequest('new-releases', token);
        const respPlaylists = this.getRequest('featured-playlists', token);
        const respCategories = this.getRequest('categories', token);
  
        Promise.allSettled([respNewRelese, respPlaylists, respCategories]).then((responses) => {
          const newReleasesData = this.getData(responses[0], 'albums');
          const respPlaylistsData = this.getData(responses[1], 'playlists');
          const respCategoriesData = this.getData(responses[2], 'categories');
  
          this.setState({
            newReleases: newReleasesData,
            playlists: respPlaylistsData,
            categories: respCategoriesData
          });
        }).catch(errors => {
          console.log(errors);
        });
      }
    } catch(error) {
      console.log('Authentication ', error);
    }
  }

  getData(resp, key) {
    if (resp && resp.status === "fulfilled" && resp.value && resp.value.status === 200) {
      return resp.value.data[key].items;
    }
    return [];
  }

  getRequest(url, token) {
    const { baseUrl } = config.api;
    const response = axios.get(baseUrl + url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response;
  }

  componentDidMount() {
    this.getAuthorizationAndData();
  }

  render() {
    const { newReleases, playlists, categories } = this.state;

    return (
      <div className="discover">
        <DiscoverBlock text="RELEASED THIS WEEK" id="released" data={newReleases} />
        <DiscoverBlock text="FEATURED PLAYLISTS" id="featured" data={playlists} />
        <DiscoverBlock text="BROWSE" id="browse" data={categories} imagesKey="icons" />
      </div>
    );
  }
}
