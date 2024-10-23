@extends('layouts.layout')

@section('title', 'Album')

@section('content')

@vite(['resources/js/showImage.js','resources/css/button.css'])



<svg xmlns="http://www.w3.org/2000/svg" class="d-none">
  <!-- SVG content -->
</svg>


<div class="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
  <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text">
    <!-- Theme selection buttons -->
  </ul>
</div>

<header data-bs-theme="dark">
  <div class="collapse text-bg-dark" id="navbarHeader">
    <div class="container">
      <div class="row">
        <div class="col-sm-8 col-md-7 py-4">
          <h4>About</h4>
          <p class="text-body-secondary">Photo Album</p>
        </div>
      </div>
    </div>
  </div>
  <div class="navbar navbar-dark bg-dark shadow-sm">
    <div class="container">
      <a href="/" class="navbar-brand d-flex align-items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="me-2" viewBox="0 0 24 24">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <strong>Album</strong>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarHeader" aria-controls="navbarHeader" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-toggler" href="{{ route('create') }}">Create Album</a>
      <a class="navbar-toggler" href="{{ route('uploadImage') }}">Upload Picture</a>
      <a class="navbar-toggler" href="{{ route('user.album') }}">My albums</a>
      <a class="navbar-toggler" href="{{ route('profile.edit') }}">Profile</a>
    </div>
  </div>
</header>

<main>
  <div class="album py-5 bg-body-tertiary">
    <div class="container">
      <button id="backButton" class="back-button" style="display:none; position: absolute; top: 100px; left: 10px; border: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
        </svg>
      </button>
      <div id="imageGallery" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"></div>
    </div>
  </div>
</main>

@endsection